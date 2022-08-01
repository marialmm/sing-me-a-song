/// <reference types="cypress" />

import * as recommendationFactory from "../../factories/recommendationFactory.js";

beforeEach(() => {
    cy.resetDatabase();
});

describe("Create recommendation", () => {
    it("Should create and show a recommendation", () => {
        cy.intercept("GET", "/recommendations").as("getRecommendations");
        cy.intercept("POST", "/recommendations").as("postRecommendation");
        cy.visit("http://localhost:3000/");
        cy.wait("@getRecommendations");

        cy.get("input[placeholder=Name]").type(
            recommendationFactory.recommendationData.name
        );
        cy.get("input[placeholder='https://youtu.be/...']").type(
            recommendationFactory.recommendationData.youtubeLink
        );
        cy.get("button").click();
        cy.wait("@postRecommendation");
        cy.wait("@getRecommendations");

        cy.get("article:first div:first").should(
            `contain.text`,
            recommendationFactory.recommendationData.name
        );
    });
});

describe("Upvote recommendation", () => {
    it("Should upvote a recommendation", () => {
        cy.createRecommendation();
        cy.intercept("GET", "/recommendations").as("getRecommendations");
        cy.intercept("POST", "/recommendations/1/upvote").as(
            "upvoteRecommendation"
        );

        cy.visit("http://localhost:3000");
        cy.wait("@getRecommendations");
        cy.get("article .upvote").click();
        cy.wait("@upvoteRecommendation");
        cy.get("article .score").should("contain.text", "1");
    });
});
