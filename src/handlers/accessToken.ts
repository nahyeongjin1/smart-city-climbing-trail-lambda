export { handler } from '@/modules/login/accessToken.handler';

/**
 * @swagger
 * /access:
 *   get:
 *     summary: 액세스 토큰을 검증하고 사용자 정보를 반환
 *     description: |
 *       이 API는 헤더에 전달된 액세스 토큰을 검증하고 사용자 정보를 반환합니다.
 *       - 사용자 정보로는 `username`, `email`, `isValid` 상태가 포함됩니다.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: 인증을 위한 Bearer 액세스 토큰
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJraWQiOiJoQzJzRUtzb0VyengxVlk5T1JcL3U4ZnZnYjZnSEJkcFc4MjVhNzNcLyt2V2M9IiwiYWxnIjoiUlMyNTYifQ..."
 *     responses:
 *       200:
 *         description: 성공적으로 액세스 토큰이 성공적으로 검증되었고 사용자 정보를 반환했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 사용자 ID
 *                   example: "8408edcc-6091-70b1-1601-36f47e91b209"
 *                 email:
 *                   type: string
 *                   description: 이메일
 *                   example: "pyeonk33@gmail.com"
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 잘못된 요청 - 요청이 잘못되었습니다.
 *       401:
 *         description: 인증되지 않음 - 만료되었거나 유효하지 않은 액세스 토큰입니다.
 *       500:
 *         description: 서버 내부 오류
 */
