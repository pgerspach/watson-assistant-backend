import {GET, Path, QueryParam, POST} from "typescript-rest";
import {Inject} from 'typescript-ioc';
import {DataApi} from '../services';
import {LoggerApi} from '../logger';

@Path('/data')
export class DataController {

  @Inject
  service: DataApi
  @Inject
  _baseLogger: LoggerApi

  get logger(): LoggerApi {
    return this._baseLogger.child('DataController');
  }

  @Path('/intent')
  @GET
  async getTopIntents(@QueryParam('number') number: number): Promise<any> {
    this.logger.info('Getting top intents...');
    const result = await this.service.getTopIntents(number);
    return result;
  }

  @Path('/entity')
  @GET
  async getTopEntity(@QueryParam('number') number: number): Promise<any> {
    this.logger.info('Getting top entities...');
    const result = await this.service.getTopEntities(number);
    return result;
  }
}