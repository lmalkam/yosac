import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';
import { google } from '@ai-sdk/google';

const photoLink = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Morgan_Hall_of_Williams_College_in_the_fall_%2827_October_2010%29.jpg/330px-Morgan_Hall_of_Williams_College_in_the_fall_%2827_October_2010%29.jpg";

async function fetchUniversityPhoto(universityName: string): Promise<string | null> {
  const cleanedName = universityName.replace(/\s*\(.?\)\s/g, '').trim();

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanedName)}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  return data?.thumbnail?.source ?? null;
}

export const universityResearch = ({ dataStream }: { dataStream?: any }) => tool({
  description:
    'Find the best universities in a given country according to QS World Ranking.',
  parameters: z.object({
    country: z.string().describe('The country to research universities in'),
    course: z.string().describe('The course to research universities for').optional(),
  }),
  execute: async ({ country, course }) => {
    if (dataStream) {
      dataStream.writeData({
        type: 'status',
        content: 'Researching universities...'
      });   
    }
    const prompt = `List the top 5 universities in ${country} in ${course ? course : ''} according to the latest QS World University Rankings. For each, provide:\n- Name\n- Global rank (according to QS World University Rankings)\n- A short description (1 sentence)\n- An approximate reputation score as a percentage (if available)\nFormat as a readable list.`;
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
    });



const { object } = await generateObject({
  model: google('gemini-2.0-flash'),
  output: 'array',
  schema: z.object({
    name: z.string().describe('The name of the university'),
    rank: z.number().describe('The global rank of the university'),
    description: z.string().describe('A short description of the university'),
    photo: z.string().describe('Link for the college Logo'),
  }),
  prompt: 'Generate the json object for universities form the given info ' + text,
});

await Promise.all(
  object.map(async (uni) => {
    const photo = await fetchUniversityPhoto(uni.name);
    uni.photo = photo ?? photoLink;
  })
);

    console.log(object);
    return { object };
  },
}); 