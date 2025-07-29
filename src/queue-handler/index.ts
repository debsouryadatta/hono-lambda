import type { APIGatewayProxyEvent, SQSEvent } from "aws-lambda";
import type { LambdaEvent } from "hono/aws-lambda";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqs } from "../lib/instance";

export interface ScheduledEvent {
    version: string;
    id: string;
    "detail-type": string;
    source: string;
    account: string;
    time: string;
    region: string;
    resources: string[];
    detail: {
      scheduledTime?: string;
      scheduleName?: string;
      [key: string]: any;
    };
  }

export type SupportedEvent =
  | SQSEvent
  | APIGatewayProxyEvent
  | LambdaEvent
  | ScheduledEvent;

export const queueConfig = {
    "hono-lambda": {
        arn: "arn:aws:sqs:ap-south-1:262276228104:hono-lambda",
        url: "https://sqs.ap-south-1.amazonaws.com/262276228104/hono-lambda",
        handler: async (event: SQSEvent) => {
            console.log("Event received:", JSON.stringify(event));
            const messages = event.Records.map((record) => record.body);
            console.log("Messages:", messages);
        }
    }
}

export async function pushToQueue(queueName: string, message: string) {
    const queue = queueConfig[queueName as keyof typeof queueConfig];
    if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
    }
    const params = {
        QueueUrl: queue.url,
        MessageBody: message,
    };
    const command = new SendMessageCommand(params);
    const result = await sqs.send(command);
    return result.MessageId;
}
