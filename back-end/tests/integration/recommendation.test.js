import supertest from "supertest";
import { prisma } from "../../src/database.js";
import app from "../../src/app.js";
import * as recommendationsFactory from "../factories/recommendationsFactory.js";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
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

describe("POST /recommendations/:id/upvote tests", () => {
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

describe("POST /recommendations/:id/downvote tests", () => {
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

describe("GET /recommendations tests", () => {
    it("Should return an array with the last 10 recommendations", async () => {
        await recommendationsFactory.insertManyRecommendations(11);

        const response = await supertest(app).get("/recommendations");

        expect(response.body.length).toBe(10);
        expect(response.body[0].id).toBe(11);
    });
});

describe("GET /recommendations/random tests", () => {
    it("Should return a single recommendation", async () => {
        await recommendationsFactory.insertManyRecommendations(3);

        const objectKeys = ["id", "name", "youtubeLink", "score"];

        const response = await supertest(app).get("/recommendations/random");

        expect(Object.keys(response.body)).toEqual(objectKeys);
    });
});

describe("GET /recommendations/top/:amount tests", () => {
    it("Given a valid amount, should return the top {amount} of recommendations", async () => {
        await recommendationsFactory.insertManyRecommendations(10);

        for (let i = 1; i <= 10; i++) {
            await recommendationsFactory.updateRecommendationScore(i);
        };

        const response = await supertest(app).get("/recommendations/top/5");

        const top5 = await prisma.recommendation.findMany({
            take: 5,
            orderBy: {
                score: "desc"
            }
        });

        expect(response.body.length).toEqual(5);
        expect(response.body).toEqual(top5);
    });
});
