import supertest from "supertest";
import { prisma } from "../src/database.js";
import app from "../src/app.js";
import * as recommendationsFactory from "./factories/recommendationsFactory.js";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("POST /recommendations tests", () => {
    it("Given a valid input, should return 201", async () => {
        const recommendationData =
            recommendationsFactory.createRecommendationData();
        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendationData);

        expect(response.statusCode).toBe(201);
    });

    it("Given a invalid input, should return 422", async () => {
        const recommendationData = {};
        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendationData);

        expect(response.statusCode).toBe(422);
    });

    it("Given a recommendation name already in use, should return 409", async () => {
        const recommendationData =
            recommendationsFactory.createRecommendationData();
        await recommendationsFactory.insertRecommendation(recommendationData);

        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendationData);

        expect(response.statusCode).toBe(409);
    });
});

describe("POST /recommendations/:id/upvote", () => {
    it("Given a valid id, should return 200 and update the recommendation score", async () => {
        const recommendationData =
            recommendationsFactory.createRecommendationData();
        await recommendationsFactory.insertRecommendation(recommendationData);

        const initialRecommendationInfo =
            await recommendationsFactory.getRecommendationInfo(
                recommendationData.name
            );

        const response = await supertest(app).post(
            `/recommendations/${initialRecommendationInfo.id}/upvote`
        );

        expect(response.statusCode).toEqual(200);

        const finalRecommendationInfo =
            await recommendationsFactory.getRecommendationInfo(
                recommendationData.name
            );

        expect(finalRecommendationInfo.score).toBe(
            initialRecommendationInfo.score + 1
        );
    });

    it("Given an invalid id, should return 404", async () => {
        const response = await supertest(app).post("/recommendations/1/upvote");
        expect(response.statusCode).toBe(404);
    });
});

describe("POST /recommendations/:id/downvote", () => {
    it("Given a valid id, should return 200 and update the recommendation score", async () => {
        const recommendationData =
            recommendationsFactory.createRecommendationData();
        await recommendationsFactory.insertRecommendation(recommendationData);

        const initialRecommendationInfo =
            await recommendationsFactory.getRecommendationInfo(
                recommendationData.name
            );

        const response = await supertest(app).post(
            `/recommendations/${initialRecommendationInfo.id}/downvote`
        );

        expect(response.statusCode).toBe(200);

        const finalRecommendationInfo =
            await recommendationsFactory.getRecommendationInfo(
                recommendationData.name
            );

        expect(finalRecommendationInfo.score).toEqual(
            initialRecommendationInfo.score - 1
        );
    });

    it("If the score is less than -5, should return 200 and delete the recommendation", async () => {
        const recommendationData =
            recommendationsFactory.createRecommendationData();
        recommendationData.score = -5;
        await recommendationsFactory.insertRecommendation(recommendationData);

        const initialRecommendationInfo =
            await recommendationsFactory.getRecommendationInfo(
                recommendationData.name
            );

        const response = await supertest(app).post(
            `/recommendations/${initialRecommendationInfo.id}/downvote`
        );

        expect(response.statusCode).toBe(200);

        const finalRecommendationInfo =
            await recommendationsFactory.getRecommendationInfo(
                recommendationData.name
            );

        expect(finalRecommendationInfo).toBeNull();
    });

    it("Given an invalid id, should return 404", async () => {
        const response = await supertest(app).post(
            "/recommendations/1/downvote"
        );
        expect(response.statusCode).toBe(404);
    });
});
