import { NextResponse } from 'next/server';
import { handleAuth } from '@auth0/nextjs-auth0';

// La forma más básica posible - sin pasar opciones
export const GET = handleAuth();
export const POST = handleAuth();