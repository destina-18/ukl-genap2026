import { NextRequest, NextResponse } from "next/server";

function cleanBaseApiUrl(url: string) {
  return url.replace(/\/$/, "").replace(/\/api$/, "");
}

function getErrorMessage(data: any, fallback: string) {
  if (Array.isArray(data?.message)) {
    return data.message.join("\n");
  }

  return data?.message || fallback;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const BASE_API_URL = cleanBaseApiUrl(
      process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app"
    );

    const backendUrl = `${BASE_API_URL}/api/admin/customers/${id}`;

    console.log("PROXY EDIT CUSTOMER URL:", backendUrl);

    const res = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          message: getErrorMessage(data, "Gagal edit customer"),
          error: data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PROXY EDIT CUSTOMER ERROR:", error);

    return NextResponse.json(
      { message: "Gagal terhubung ke backend" },
      { status: 500 }
    );
  }
}