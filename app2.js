const axios = require("axios");
const rax = require("retry-axios");

const URL = "https://findtreasure.app/api/v1";
const gameStartUrl = "https://findtreasure.app/api/v1/games/test/start";

let treasuresFound = 0;
let treasuresMissed = 0;
let USED_URLS = [];

const getNewToken = async () => {
  try {
    const response = await axios.post(`${URL}/contestants/refresh`, {
      email: "yusufdamiloju@gmail.com",
    });
    if (response.status === 200) {
      return response.data.token;
    }

    return "";
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const getResolvedURLs = async (response) => {
  let URLS = response
    .filter((res) => {
      if (
        (res && res.status === 200) ||
        (res && res.status === 208) ||
        (res && res.status === 302)
      ) {
        if (res.status === 302) {
          treasuresFound++;
        }

        if (res.status === 208) {
          treasuresMissed++;
        }

        const item = res.config.url;

        if (USED_URLS.indexOf(item) === -1) {
          USED_URLS.push(item);
        }

        return true;
      }

      return false;
    })
    .map((res) => res.data.paths);

  URLS = URLS.flat(1);

  return URLS;
};

const getRateLimitedURLs = async (response) => {
  let limit = null;

  const rateLimitedURLs = response
    .filter((res) => {
      if (response && res.status === 429) {
        limit = res;

        return true;
      }
      return false;
    })
    .map((res) => res.config.url);

  return { rateLimitedURLs, limit };
};

const getNodeData = async (axiosInstance, urls) => {
  const response = await Promise.all(urls.map((url) => axiosInstance.get(url)));

  const resolvedURLSPaths = await getResolvedURLs(response);
  const { rateLimitedURLs, limit } = await getRateLimitedURLs(response);

  const URLS = [...new Set(resolvedURLSPaths.concat(rateLimitedURLs))];

  return { URLS, limit };
};

const run = async (URLS) => {
  const token = await getNewToken();
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      gomoney: `08164527760`,
    },
    validateStatus: function (status) {
      return status >= 200 && status < 600; // default
    },
  });

  axiosInstance.defaults.raxConfig = {
    instance: axiosInstance,
    retry: 3,
    statusCodesToRetry: [[500, 502, 503, 504]],
  };

  rax.attach(axiosInstance);
  console.time("Time Taken");
  const data = await getNodeData(axiosInstance, URLS);
  let NEXT_URLS = [
    ...new Set(data.URLS.filter((url) => !USED_URLS.includes(url))),
  ];
  if (data.limit) {
    await new Promise((resolve) => {
      console.log("Waiting for limit");
      return setTimeout(resolve, 60000);
    });
  }
  console.log("Missed Treasures", treasuresMissed);
  console.log("Found Treasures", treasuresFound);
  console.timeEnd("Time Taken");
  console.log("------------------------------");
  console.log("------------------------------");

  if (data.limit && NEXT_URLS.length < 1) {
    NEXT_URLS = [...URLS];
  }

  if (treasuresFound + treasuresMissed === 3 || NEXT_URLS.length < 1) {
    console.timeEnd("Total Time Taken");
    return;
  }

  await run(NEXT_URLS);
};

console.time("Total Time Taken");
run([gameStartUrl]);
