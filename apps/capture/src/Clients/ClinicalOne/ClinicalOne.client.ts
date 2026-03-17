import axios from 'axios';
import { ClinicalOneFormType, IClinicalOneFromDataRequest, IClinicalOneResp } from 'Models/ClinicalOne/ClinicalOne.model';
import { IV2ClinicalOneRequest, IV2ClinicalOneResp } from 'Models/ClinicalOne/V1ClinicalOne.model';
import getBearerToken from 'Utils/Auth/getBearerToken';
import { normalizeString } from 'Utils/string.util';

export class ClinicalOneClient {
  private readonly dataCaptureBaseURL = normalizeString(process.env.CAPI_API_BASE_URL);

  private readonly version = normalizeString(process.env.C1_API_VERSION);

  private readonly mode = normalizeString(process.env.C1_API_MODE);

  private readonly instance = axios.create({
    baseURL: this.dataCaptureBaseURL,
  });

  public async makeAPICall<T = ClinicalOneFormType>(
    request: IClinicalOneFromDataRequest,
  ): Promise<IClinicalOneResp<T>> {
    const token = await getBearerToken();
    const resp = await this.instance.get<IClinicalOneResp<T>>('formDataPro', {
      params: {
        mode: this.mode,
        version: this.version,
        ...request,
      },
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${token.access_token}`,
      },
    });
    return resp.data;
  }

  public async makeV2APICall(
    request: IV2ClinicalOneRequest,
  ): Promise<IV2ClinicalOneResp> {
    const token = await getBearerToken();
    const resp = await this.instance.post<IV2ClinicalOneResp[]>(
      '/c1-api/c1api/visitlist/search',
      request,
      {
        headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );
    return resp.data[0];
  }
}
