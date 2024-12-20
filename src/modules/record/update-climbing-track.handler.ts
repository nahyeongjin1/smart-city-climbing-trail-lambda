import dayjs from 'dayjs';
import { ClimbingTrackDTO } from './dto/climbing-track.dto';
import ClimbingTrackModel from './dto/climbing-track';
import { HttpStatus } from '@/common/constants/http-status';
import { createGatewayHandler } from '@/lambda';
import connectDB from '@/utils/dbClient';
import { ERROR_CODE } from './exception/error-code';
import { ClimbingTrackException } from './exception/climbing-track.exception';
import { LoginException } from '../login/exception/login.exception';
import { getSubFromAccessToken } from '@/utils/getSub';
import { getWeightApi } from './service/get-weight.service';
import { calculateCalories } from './service/calculate-calories.service';

export const handler = createGatewayHandler<ClimbingTrackDTO>(async (req, res) => {
  const authorizationHeader = req.headers?.Authorization || req.headers?.authorization;

  if (!authorizationHeader) {
    throw new LoginException(ERROR_CODE.MISSING_ACCESS_TOKEN);
  }

  const accessToken = authorizationHeader.split(' ')[1];

  if (!accessToken) {
    throw new LoginException(ERROR_CODE.MISSING_ACCESS_TOKEN);
  }

  const sub = await getSubFromAccessToken(accessToken);

  if (!sub) {
    throw new ClimbingTrackException(ERROR_CODE.MISSING_REQUIRED_PARAM);
  }

  const { trailName, startDate, endDate, distance } = req.body as {
    trailName: string;
    startDate: Date;
    endDate: Date;
    distance: number;
  };

  const weight = await getWeightApi(accessToken);
  let calories = 0;
  if (weight == null) {
    calories = calculateCalories(startDate, endDate);
  } else {
    calories = calculateCalories(startDate, endDate, weight);
  }

  if (!trailName || !startDate || !endDate || !distance) {
    throw new ClimbingTrackException(ERROR_CODE.NOT_FORMAT);
  }

  await connectDB();

  const newTrack = {
    trailName,
    startDate: dayjs(startDate).toDate(), // 날짜는 Date 객체로 변환하여 저장
    endDate: dayjs(endDate).toDate(), // 날짜는 Date 객체로 변환하여 저장
    distance,
    calories,
  };

  // sub에 해당하는 사용자 문서 찾기
  const userTrack = await ClimbingTrackModel.findOne({ sub });

  if (userTrack) {
    // 이미 해당 사용자(sub)에 클라이밍 기록이 있다면, 새 트랙을 추가
    userTrack.tracks.push(newTrack); // 트랙을 배열에 추가
    await userTrack.save();
  } else {
    // 해당 사용자(sub)가 없다면 새 문서로 생성
    const newClimbingTrack = new ClimbingTrackModel({
      sub,
      tracks: [newTrack], // 첫 번째 트랙으로 시작
    });

    await newClimbingTrack.save();
  }

  const data: ClimbingTrackDTO = new ClimbingTrackDTO({
    sub,
    trailName,
    startDate: dayjs(startDate).toDate(), // 날짜는 Date 객체로 변환하여 저장
    endDate: dayjs(endDate).toDate(), // 날짜는 Date 객체로 변환하여 저장
    distance,
    calories,
  });

  return res({
    status: HttpStatus.OK,
    body: data,
  });
});
