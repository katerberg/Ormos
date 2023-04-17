import axios from 'axios';
import {SetsForCardsResponseData} from '../shared/sharedTypes';
import {API_BASE} from './constants';

type ErrorResponse = {
  error: string;
};

function cardListToJson(cardList: string): string[] {
  return cardList
    .split('\n')
    .filter((c) => c)
    .map((c) => c.trim());
}

export async function fetchSetsForCards(
  cardList: string,
): Promise<{data: SetsForCardsResponseData[]; error: string | null}> {
  let error: string | null = null;
  try {
    const axiosCall = await axios.post(`${API_BASE}/setsForCards`, cardListToJson(cardList), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return axiosCall.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      ({error} = e.response?.data as ErrorResponse);
    } else {
      error = 'Unknown error';
    }
    return {data: [], error};
  }
}
