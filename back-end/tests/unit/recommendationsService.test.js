import { jest } from "@jest/globals";

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import * as recommendationsFactory from "../factories/recommendationsFactory.js";

jest.mock("../../src/repositories/recommendationRepository");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Create recommendation tests", () => {
    it("Should create a recommendation", async () => {
        jest.spyOn(
            recommendationRepository,
            "findByName"
        ).mockResolvedValueOnce(null);

        jest.spyOn(recommendationRepository, "create").mockImplementation(
            () => {}
        );

        const recommendationData =
            recommendationsFactory.createRecommendationData();

        await recommendationService.insert(recommendationData);

        expect(recommendationRepository.create).toHaveBeenCalledTimes(1);
    });

    it("Given a recommendation name that already exists, should not create a recommendation", async () => {
        const recommendationData =
            recommendationsFactory.createRecommendationData();
        jest.spyOn(
            recommendationRepository,
            "findByName"
        ).mockResolvedValueOnce(recommendationData);

        const promise = recommendationService.insert(recommendationData);

        expect(promise).rejects.toEqual({
            type: "conflict",
            message: "Recommendations names must be unique",
        });
        expect(recommendationRepository.create).not.toHaveBeenCalled();
    });
});

describe("Upvote recommendation tests", () => {
    it("Should update score", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce({
            id: 1,
        });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementation(
            () => {}
        );

        await recommendationService.upvote(1);

        expect(recommendationRepository.updateScore).toHaveBeenCalledTimes(1);
    });

    it("Given a id that doesn't exist, should throw a not found error", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(
            null
        );

        const promise = recommendationService.upvote(1);

        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
        expect(recommendationRepository.updateScore).not.toHaveBeenCalled();
    });
});

describe("Downvote recommendation tests", () => {
    it("Should update score", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValue({
            id: 1,
        });
        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockResolvedValueOnce({
            score: 1,
        });
        jest.spyOn(recommendationRepository, "remove").mockImplementation(
            () => {}
        );
        await recommendationService.downvote(1);

        expect(recommendationRepository.updateScore).toHaveBeenCalledTimes(1);
        expect(recommendationRepository.remove).not.toHaveBeenCalled();
    });

    it("Given a score that is less than -5, should remove the recommendation", async () => {
        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockResolvedValueOnce({
            score: -6,
        });

        await recommendationService.downvote(1);

        expect(recommendationRepository.updateScore).toHaveBeenCalledTimes(1);
        expect(recommendationRepository.remove).toHaveBeenCalledTimes(1);
    });

    it("Given an id that doesn't exist, should throw a not found error", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(
            null
        );

        const promise = recommendationService.downvote(1);

        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
        expect(recommendationRepository.updateScore).not.toHaveBeenCalled();
    });
});

describe("Get a random recommendation tests", () => {
    it("Should return a random recommendation with a score greater than 10 ", async () => {
        jest.spyOn(Math, "random").mockReturnValueOnce(0.6);

        const recommendationData1 =
            recommendationsFactory.createRecommendationData();
        const recommendationData2 =
            recommendationsFactory.createRecommendationData();

        recommendationData1.score = 11;
        recommendationData2.score = 5;

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(
            (filter) => {
                const { score, scoreFilter } = filter;
                if (scoreFilter === "gt") return [recommendationData1];
                if (scoreFilter === "lte") return [recommendationData2];
            }
        );

        const response = await recommendationService.getRandom();

        expect(response).toEqual(recommendationData1);
        expect(recommendationRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("Should return a recommendation with a score less than 10", async () => {
        jest.spyOn(Math, "random").mockReturnValueOnce(0.8);

        const recommendationData1 =
            recommendationsFactory.createRecommendationData();
        const recommendationData2 =
            recommendationsFactory.createRecommendationData();

        recommendationData1.score = 11;
        recommendationData2.score = 5;

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(
            (filter) => {
                const { score, scoreFilter } = filter;
                if (scoreFilter === "gt") return [recommendationData1];
                if (scoreFilter === "lte") return [recommendationData2];
            }
        );

        const response = await recommendationService.getRandom();

        expect(response).toEqual(recommendationData2);
        expect(recommendationRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("Should throw a not found error when there are no recommendations", () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(
            () => []
        );

        const promise = recommendationService.getRandom();
        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
    });
});

describe("Get recommendations tests", () => {
    it("Should return a list of recommendations", async () => {
        const recommendation =
            recommendationsFactory.createRecommendationData();
        jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([
            recommendation,
        ]);

        const response = await recommendationService.get();

        expect(response).toEqual([recommendation]);
        expect(recommendationRepository.findAll).toHaveBeenCalledTimes(1);
    });
});

