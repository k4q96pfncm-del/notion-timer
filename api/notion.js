// 이 코드는 Vercel 환경에서 자동으로 실행됩니다.
// HTML에서 '/api/notion'을 호출하면 이 함수가 응답합니다.

// [수정] import 대신 require 사용 (호환성 문제 해결)
const { Client } = require('@notionhq/client');

// .env 파일이나 Vercel 환경변수에서 키를 가져옵니다.
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// [수정] export default 대신 module.exports 사용
module.exports = async (request, response) => {
  // CORS 처리 (필요한 경우)
  // Vercel 배포 시 같은 도메인이면 생략 가능하지만, 로컬 테스트 등을 위해 추가하면 좋습니다.
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청(Preflight) 처리
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // POST 요청만 처리
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 프론트엔드에서 보낸 필터 조건이 있다면 받을 수 있지만,
    // 여기서는 보안을 위해 서버에서 직접 조건을 설정합니다.
    const queryResponse = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'sStask', // 본인의 노션 속성 이름에 맞춰 수정하세요
            status: {
              equals: '시작 전',
            },
          },
          {
            property: '시작시간', // 본인의 노션 속성 이름에 맞춰 수정하세요
            date: {
              is_not_empty: true,
            },
          },
        ],
      },
      page_size: 1,
      sorts: [
        {
          property: '시작시간', // 본인의 노션 속성 이름에 맞춰 수정하세요
          direction: 'descending',
        },
      ],
    });

    // 성공적으로 데이터를 가져오면 프론트엔드에 전달
    return response.status(200).json(queryResponse);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Notion API 호출 중 에러가 발생했습니다.' });
  }
};