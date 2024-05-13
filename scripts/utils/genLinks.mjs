import querystring from 'query-string';

function generateDownloadLinks(id, expiration) {
  const queryParam = querystring.stringify({ expires: expiration })
  return `/download/${id}?${queryParam}`;
}
export default generateDownloadLinks;