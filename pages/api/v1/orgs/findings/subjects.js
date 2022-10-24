import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}

export default withApiAuthRequired(async function shows(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res);
    const apiGateway = process.env.API_GATEWAY;
    const { query } = req;

    let url = `${apiGateway}/v1/orgs/${query.orgId || '307d8c43-2ccc-443f-a275-44cda67213bb'}/findings/subjects`;
    delete query.orgId;

    encodeQueryData(query) !== '' && (url += `?${encodeQueryData(query)}`);

    console.log(url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const shows = await response.json();
    res.status(200).json(shows);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
