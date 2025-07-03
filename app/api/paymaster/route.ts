import { NextRequest, NextResponse } from 'next/server';
import { baseSepolia } from 'viem/chains';

export async function POST(request: NextRequest) {
  try {
    const { calls, chainId } = await request.json();
    
    // Verify it's Base Sepolia
    if (chainId !== baseSepolia.id) {
      return NextResponse.json(
        { error: 'Paymaster only available on Base Sepolia' },
        { status: 400 }
      );
    }

    // In a real app, you would implement proper paymaster logic here
    // For demo purposes, we'll return a mock response
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    
    if (!paymasterUrl) {
      return NextResponse.json(
        { error: 'Paymaster URL not configured' },
        { status: 500 }
      );
    }

    // Forward to actual Coinbase Paymaster
    const paymasterResponse = await fetch(paymasterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CDP_API_KEY}`,
      },
      body: JSON.stringify({
        method: 'pm_sponsorUserOperation',
        params: [
          {
            calls,
            chainId: chainId.toString(),
          }
        ],
        id: 1,
        jsonrpc: '2.0',
      }),
    });

    if (!paymasterResponse.ok) {
      throw new Error('Paymaster request failed');
    }

    const paymasterData = await paymasterResponse.json();
    
    return NextResponse.json({
      success: true,
      paymasterData,
      message: 'Transaction sponsored successfully',
    });

  } catch (error) {
    console.error('Paymaster API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sponsor transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 