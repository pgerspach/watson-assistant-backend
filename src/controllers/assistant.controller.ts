import {POST, Path, DELETE, PathParam, Context, ServiceContext} from "typescript-rest";
import {Inject} from 'typescript-ioc';
import {AssistantApi} from '../services';
import {AssistantRestUtil} from '../util/rest';
import {LoggerApi} from '../logger';
import {AssistantMessageRequest} from '../model';

@Path('/assistant')
export class AssistantController {

  @Inject
  service: AssistantApi
  @Inject
  _baseLogger: LoggerApi
  @Inject
  util: AssistantRestUtil

  get logger(): LoggerApi {
    return this._baseLogger.child('AssistantController');
  }

  @Path('/session')
  @POST
  async createSession(@Context context: ServiceContext): Promise<any> {
    this.logger.info('Creating new session...');
    const result = await this.service.createSession();
    return this.util.transformResponse(context, result);
  }

  @Path('/message')
  @POST
  async sendMessage(request: AssistantMessageRequest, @Context context: ServiceContext): Promise<any> {
    const transformParams = {
      headers: {
        exclude: ['transfer-encoding']
      }
    };
    this.logger.info(`Sending message with sessionId: ${request.sessionId} and text ${request.text}`);
    const result = await this.service.sendMessage(request.sessionId, request.text);
    return this.util.transformResponse(context, result, transformParams);
  }

  @Path('/session/:id')
  @DELETE
  async deleteSession(@PathParam('id') sessionId: string, @Context context: ServiceContext): Promise<any> {
    this.logger.info(`Deleting session ${sessionId}`);
    const result = await this.service.deleteSession(sessionId); 
    return this.util.transformResponse(context, result);
  }
}