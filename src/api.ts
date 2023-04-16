import axios from 'axios';
import {API_BASE} from './constants';
import {SetForCards} from './sharedTypes';

type ErrorResponse = {
  error: string;
};

export async function fetchSetsForCards(cardList: string): Promise<{data: SetForCards[]; error: string | null}> {
  let response: SetForCards[] = [];
  let error: string | null = null;
  try {
    const axiosCall = await axios.post(`${API_BASE}/setsForCards`, cardList);
    response = axiosCall.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      ({error} = e.response?.data as ErrorResponse);
    } else {
      error = 'Unknown error';
    }
  }
  return {data: response, error};
}
