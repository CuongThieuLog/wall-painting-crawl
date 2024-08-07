import { NestFactory } from '@nestjs/core'
import { AppModule } from './models/app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({ origin: '*', credentials: true })

  // Set global prefix
  app.setGlobalPrefix('/api/v1')

  // await app.listen(process.env.PORT || 0)
  await app.listen(3030)
}
bootstrap()
