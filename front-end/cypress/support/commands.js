import * as recommendationFactory from "../factories/recommendationFactory.js";

Cypress.Commands.add("createRecommendation", () => {
    const recommendationData = recommendationFactory.recommendationData;

    cy.request("POST", "/recommendations", recommendationData);
});
