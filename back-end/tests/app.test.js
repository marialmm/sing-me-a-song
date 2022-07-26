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
