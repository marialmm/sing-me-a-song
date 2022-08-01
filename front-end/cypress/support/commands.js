import * as recommendationFactory from "../factories/recommendationFactory.js";

Cypress.Commands.add("createRecommendation", () => {
    const recommendationData = recommendationFactory.recommendationData;

    cy.request("POST", "http://localhost:5000/recommendations", recommendationData);
});

Cypress.Commands.add("resetDatabase", () => {
    cy.request("DELETE", "http://localhost:5000/reset-database");
})