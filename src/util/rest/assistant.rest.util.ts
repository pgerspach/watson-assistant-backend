
import {ServiceContext} from "typescript-rest";
import {Singleton, OnlyInstantiableByContainer} from 'typescript-ioc';
import {Response, SessionResponse, MessageResponse, Empty} from 'ibm-watson/assistant/v2';
import * as _ from 'lodash';

interface headerParams {
  exclude?: string[],
  include?: string[]
}

interface transformParams {
  headers?: headerParams
}

@Singleton
@OnlyInstantiableByContainer
export class AssistantRestUtil {
  addHeaders(context: ServiceContext, headers: Record<string, string | string[]>, params?: headerParams): void {
    if(params?.include){
      headers = _.pick(headers, params.include);
    }
    if(params?.exclude){
      headers = _.omit(headers, params.exclude);
    }

    for(const [key, val] of Object.entries(headers)){
      context.response.setHeader(key, val);
    }
  }

  transformResponse(context: ServiceContext, response: Response<SessionResponse | MessageResponse | Empty>, params?: transformParams): any {
    this.addHeaders(context, response.headers, params?.headers);
    return response.result;
  }
}