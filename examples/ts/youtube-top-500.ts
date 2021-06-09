import SocialBlade, { YouTubeTop } from '../../lib'; // from "socialblade"
import 'isomorphic-unfetch';

const client = new SocialBlade('cli_f0d30ff74a331ee97e486558',
'7574a0b5ff5394fd628727f9d6d1da723a66736f3461930c79f4080073e09e349f5e8e366db4500f30c82335aa832b64b7023e0d8a6c7176c7fe9a3909fa43b7');

// Costs 10 credits per page / i.e. per 100
const top = async (total: number): Promise<string[]> => {
  const pages: number = Math.ceil(total / 100);
  const results: YouTubeTop[][] = [];

  for (let index = 0; index < pages; index++) {
    results.push(await client.youtube.top('subscribers', index + 1));
  }

  // Convert all the Channels into an array of YouTube Links
  return results
    .reduce((a: YouTubeTop[], v: YouTubeTop[]) => a.concat(v))
    .map((channel) => `https://youtube.com/channel/${channel.id.id}`);
};

top(500).then(console.log).catch(console.error);
