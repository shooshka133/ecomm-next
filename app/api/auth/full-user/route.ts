import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data.user);
}

// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export async function GET() {
//   const supabase = createRouteHandlerClient({ cookies });
//   const { data } = await supabase.auth.getUser();
//   return Response.json(data.user);
// }

// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export async function GET() {
//   const supabase = createRouteHandlerClient({ cookies });

//   // Get the authenticated user (full fields)
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (error || !user) {
//     return NextResponse.json(
//       { error: error?.message || "Not authenticated" },
//       { status: 401 }
//     );
//   }

//   return NextResponse.json({ user });
// }
