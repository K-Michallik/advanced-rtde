import { ApplicationNode } from '@universal-robots/contribution-api';

export interface RtdeCommunicatorNode extends ApplicationNode {
  type: string;
  version: string;
}
