import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Data validation callback received:', body);
    
    // Process the profile data received from Smart Wallet
    const { email, name, physicalAddress, phoneNumber } = body;
    
    // Here you would typically:
    // 1. Validate the data
    // 2. Store it in your database
    // 3. Process subscription
    // 4. Send confirmation emails, etc.
    
    // For this demo, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Profile data received and processed',
      timestamp: new Date().toISOString(),
      processedData: {
        email: email ? '✅ Verified' : null,
        name: name ? '✅ Verified' : null,
        address: physicalAddress ? '✅ Verified' : null,
        phone: phoneNumber ? '✅ Verified' : null,
      }
    });
    
  } catch (error) {
    console.error('Data validation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process profile data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 