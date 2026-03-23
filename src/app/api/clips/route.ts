import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { getDownloadUrl, generateClipKey } from "@/lib/storage/r2";

// GET - List clips for a project or get clip details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clipId = searchParams.get("clipId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // In production, this would query the database
    // For now, return mock data or stored state

    if (clipId) {
      // Return single clip
      return NextResponse.json({
        id: clipId,
        projectId,
        status: "completed",
        // ... other clip data
      });
    }

    // Return all clips for project
    return NextResponse.json({
      projectId,
      clips: [],
    });
  } catch (err) {
    console.error("Get clips error:", err);
    return NextResponse.json(
      { error: "Failed to get clips" },
      { status: 500 }
    );
  }
}

// POST - Create a new clip (manual selection)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, startTime, endTime, title, captionStyle, aspectRatio } = body;

    if (!projectId || startTime === undefined || endTime === undefined) {
      return NextResponse.json(
        { error: "projectId, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    // Validate clip duration (max 90 seconds)
    const duration = endTime - startTime;
    if (duration > 90) {
      return NextResponse.json(
        { error: "Clip duration cannot exceed 90 seconds" },
        { status: 400 }
      );
    }
    if (duration < 5) {
      return NextResponse.json(
        { error: "Clip duration must be at least 5 seconds" },
        { status: 400 }
      );
    }

    const clipId = `clip-${Date.now()}`;

    // In production, save to database and queue for rendering
    return NextResponse.json({
      id: clipId,
      projectId,
      startTime,
      endTime,
      title: title || "Untitled Clip",
      captionStyle: captionStyle || "modern",
      aspectRatio: aspectRatio || "portrait",
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Create clip error:", err);
    return NextResponse.json(
      { error: "Failed to create clip" },
      { status: 500 }
    );
  }
}

// PATCH - Update clip settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { clipId, projectId, ...updates } = body;

    if (!clipId || !projectId) {
      return NextResponse.json(
        { error: "clipId and projectId are required" },
        { status: 400 }
      );
    }

    // In production, update in database
    return NextResponse.json({
      id: clipId,
      projectId,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Update clip error:", err);
    return NextResponse.json(
      { error: "Failed to update clip" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a clip
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clipId = searchParams.get("clipId");
    const projectId = searchParams.get("projectId");

    if (!clipId || !projectId) {
      return NextResponse.json(
        { error: "clipId and projectId are required" },
        { status: 400 }
      );
    }

    // In production, delete from database and storage
    return NextResponse.json({
      success: true,
      deletedId: clipId,
    });
  } catch (err) {
    console.error("Delete clip error:", err);
    return NextResponse.json(
      { error: "Failed to delete clip" },
      { status: 500 }
    );
  }
}
