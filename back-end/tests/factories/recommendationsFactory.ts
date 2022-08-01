import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";

export function createRecommendationData() {
    const recommendationData = {
        name: faker.music.songName(),
        youtubeLink: `www.youtube.com/${faker.random.alpha({ count: 10 })}`,
    };

    return recommendationData;
}

interface Recommendation {
    name: string;
    youtubeLink: string;
}

export async function insertRecommendation(recommendationData: Recommendation) {
    await prisma.recommendation.create({
        data: recommendationData,
    });
}

export async function getRecommendationInfo(name: string) {
    const recommendationInfo = await prisma.recommendation.findFirst({
        where: { name },
    });

    return recommendationInfo;
}

export async function insertManyRecommendations(number: number) {
    const recommendations = [];

    for (let i = 0; i < number; i++) {
        const recommendation = createRecommendationData();
        recommendations.push(recommendation);
    }

    await prisma.recommendation.createMany({
        data: recommendations,
    });
}