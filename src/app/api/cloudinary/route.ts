import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const orgId = (formData.get("orgId") as string) || "default_org";
    const jobId = (formData.get("jobId") as string) || "default_job";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type;
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    // Target directory path with org-control prepended
    const targetFolder = `org-control/org_${orgId}/job_${jobId}/resumes`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials are provided in .env
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      console.log(
        `[Cloudinary Live] Uploading ${file.name} to directory: ${targetFolder}`,
      );

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: targetFolder,
        resource_type: "auto",
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        folder: targetFolder,
      });
    }

    // Fallback simulated local storage if Cloudinary config is missing
    const publicId = `${targetFolder}/cloudinary_mock_${Date.now()}`;
    console.log(
      `[Cloudinary Simulation] Config missing. Mock uploading ${file.name} to folder: ${targetFolder}`,
    );

    return NextResponse.json({
      success: true,
      url: fileUri,
      public_id: publicId,
      secure_url: fileUri,
      folder: targetFolder,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const jobId = searchParams.get("jobId");

    if (!orgId || !jobId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: orgId and jobId" },
        { status: 400 },
      );
    }

    const targetFolder = `org-control/org_${orgId}/job_${jobId}/resumes`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      console.log(`[Cloudinary Live] Listing resources under folder: ${targetFolder}`);

      // Query Cloudinary Search API to get all uploaded resumes in this folder
      const result = await cloudinary.search
        .expression(`folder:${targetFolder}`)
        .sort_by("created_at", "desc")
        .max_results(100)
        .execute();

      return NextResponse.json({
        success: true,
        data: result.resources.map((res: any) => ({
          public_id: res.public_id,
          secure_url: res.secure_url,
          filename: res.filename,
          format: res.format,
          bytes: res.bytes,
          created_at: res.created_at,
        })),
      });
    }

    // High fidelity fallback simulation
    console.log(`[Cloudinary Simulation] Config missing. Returning mock resources under folder: ${targetFolder}`);
    return NextResponse.json({
      success: true,
      data: [
        {
          public_id: `${targetFolder}/cloudinary_mock_1`,
          secure_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
          filename: "sample_resume_mock.pdf",
          format: "pdf",
          bytes: 15420,
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (error: any) {
    console.error("Cloudinary listing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
