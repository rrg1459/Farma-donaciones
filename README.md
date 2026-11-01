This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Inventario de medicamentos, insumos y equipos

Para una instalación nueva, ejecuta en el editor SQL de Supabase, en este orden:
[script sql inicial](./script%20sql%20inicial),
[supabase-donation-function.sql](./supabase-donation-function.sql),
[supabase-delivery-function.sql](./supabase-delivery-function.sql) y
[supabase-items-extension.sql](./supabase-items-extension.sql). Si el sistema ya está
instalado, ejecuta solamente la extensión después de las funciones existentes. Esta
añade catálogo y existencias para las nuevas categorías sin reemplazar los datos de
medicamentos.

Los insumos pueden tener lote y fecha de caducidad opcionales; si se registra una fecha,
también se exige lote. Los equipos no requieren lote ni caducidad. En ambos casos se
registra cantidad, ubicación, donante y movimientos de entrada y entrega.
Para cargar los datos de demostración, ejecuta [supabase-seed.sql](./supabase-seed.sql)
después de la extensión. El seed elimina los datos actuales de inventario antes de
insertar ejemplos de medicamentos, curitas, tapabocas, tensiómetros y sillas de ruedas;
úsalo solo en desarrollo o después de respaldar la información.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
