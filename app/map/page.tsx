import { connection } from 'next/server';
import { Header } from '../components/Header';
import MapClient from './MapClient';

export const instant = false;

export default async function MapPage() {
  await connection();

  return (
    <>
      <Header />
      <MapClient />
    </>
  );
}
