import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessTriggerType,
  ServerlessFunction,
  Query,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';
// import { Context } from '@midwayjs/express';
// import { Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

@Provide()
export class HelloHTTPService {
  // @Inject()
  // ctx: ContextFaas;

  @Inject()
  ctx: Context;

  // @Inject()
  // req: Request;

  // @Inject()
  // res: Response;

  @ServerlessFunction({
    functionName: 'hello',
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midwayjs') {
    let browser: Browser | undefined = undefined;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto('https://www.baidu.com/');

      const buffer = await page.screenshot({
        type: 'png',
        fullPage: true,
      });
      await browser.close();
      this.ctx.set('Content-Type', 'image/png');
      /** 定义 Content-Disposition 后，浏览器会自动下载文件 */
      this.ctx.set('Content-Disposition', 'attachment; filename=baidu.png');
      this.ctx.status = 200;
      this.ctx.body = buffer;
    } catch (err) {
      await browser?.close();
      console.error(err);
      return Promise.resolve('screenshot fail');
    }
  }
}
