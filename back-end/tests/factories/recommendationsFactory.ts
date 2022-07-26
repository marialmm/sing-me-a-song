import {faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";

export function createRecommendationData(){
    const recommendationData = {
        name: faker.music.songName(),
        youtubeLink: `www.youtube.com/${faker.random.alpha({count: 10})}`
    }

    return recommendationData;
}

interface Recommendation {
    name: string;
    youtubeLink: string;
}

export async function insertRecommendation(recommendationData: Recommendation){
    await prisma.recommendation.create({
        data: recommendationData
    })
}

export async function getRecommendationInfo(name: string) {
    const recommendationInfo = await prisma.recommendation.findFirst({
        where: {name}
    });

    return recommendationInfo;
}