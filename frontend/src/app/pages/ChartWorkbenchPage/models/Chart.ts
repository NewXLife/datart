/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ChartConfig,
  ChartDataSectionConfig,
  ChartStyleSectionConfig,
} from 'app/types/ChartConfig';
import ChartDataset from 'app/types/ChartDataset';
import ChartMetadata from 'app/types/ChartMetadata';
import DatartChartBase, {
  ChartMouseEvent,
  ChartStatus,
} from 'app/types/DatartChartBase';
import { isInRange } from 'app/utils/chartHelper';
import { isEmpty } from 'utils/object';
import ChartEventBroker from './ChartEventBroker';

class Chart extends DatartChartBase {
  meta: ChartMetadata;
  config?: ChartConfig;
  dataset?: ChartDataset;
  dependency: string[] = [];
  isISOContainer: boolean | string = false;

  _state: ChartStatus = 'init';
  _stateHistory: ChartStatus[] = [];
  _hooks?: ChartEventBroker;
  _mouseEvents?: ChartMouseEvent[] = [];

  set state(state: ChartStatus) {
    this._state = state;
    this._stateHistory.push(state);
  }

  get state() {
    return this._state;
  }

  constructor(id: string, name: string, icon?: string, requirements?: []) {
    super();

    const fontIcon = `iconfont icon-${
      !icon ? 'fsux_tubiao_zhuzhuangtu1' : icon
    }`;
    this.meta = {
      id,
      name,
      icon: fontIcon,
      requirements,
    };
    this.state = 'init';
  }

  public init(config: any) {
    this.config = config;
  }

  public registerMouseEvents(events: Array<ChartMouseEvent>) {
    this._mouseEvents = events;
  }

  public isMatchRequirement(config?: ChartConfig) {
    if (!config) {
      return true;
    }
    return this.isMatchRequiredSectionLimition(config.datas);
  }

  public getStateHistory() {
    return this._stateHistory.join(' - ');
  }

  public getDependencies(): string[] {
    return this.dependency;
  }

  public onMount(options, context?): void {
    throw new Error(`${this.meta.name} - Method not implemented.`);
  }

  public onUpdated(options, context?): void {
    throw new Error(`${this.meta.name} - Method not implemented.`);
  }

  public onUnMount(options, context?): void {
    throw new Error(`${this.meta.name} - Method not implemented.`);
  }

  public onResize(options, context?): void {}

  protected getStyleValue(
    styleConfigs: ChartStyleSectionConfig[],
    paths: string[],
  ): any {
    return this.getValue(styleConfigs, paths, 'value');
  }

  protected getColNameByValueColName(series) {
    return series?.data?.valueColName || series.seriesName;
  }

  private getValue(
    configs: ChartStyleSectionConfig[] = [],
    paths?: string[],
    targetKey?,
  ) {
    if (!Array.isArray(configs)) {
      return null;
    }

    const key = paths?.shift();
    const group = configs?.find(sc => sc.key === key);
    if (!group) {
      return null;
    }
    if (paths?.length === 0) {
      return isEmpty(group) ? null : group[targetKey];
    }
    return this.getValue(group.rows, paths, targetKey);
  }

  private isMatchRequiredSectionLimition(
    dataConfigs?: ChartDataSectionConfig[],
  ) {
    return (dataConfigs || [])
      .filter(config => Boolean(config?.required))
      .every(config => {
        return isInRange(config?.limit, config?.rows?.length);
      });
  }
}

export default Chart;
