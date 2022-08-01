import { jest } from "@jest/globals";

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import * as recommendationsFactory from "../factories/recommendationsFactory.js";

jest.mock("../../src/repositories/recommendationRepository");

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
    });
});
