import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper function to determine media type from command details
function getMediaType(command: string): 'DASH' | 'MP3' | 'HLS' | 'MP4' | 'Video' | 'Other' {
  // This logic should ideally be more robust, perhaps passed from the client,
  // but for the purpose of this task, we'll infer based on the command context
  // or assume the client sends the media type in the request body.
  // Since the client-side logic is complex, we'll assume the client sends it.
  // For now, we'll default to 'Video' or 'Other'.
  // The client will be responsible for sending the correct media_type.
  // We will update the function to expect media_type in the request body.
  return 'Other'; 
}

Deno.serve(async (req) => {
  try {
    const { command, user_id, media_type } = await req.json()

    if (!command || !user_id || !media_type) {
      return new Response(
        JSON.stringify({ error: 'Missing command, user_id, or media_type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const supabaseClient = createClient(
      // Supabase API URL - env var uploaded by vercel
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var uploaded by vercel
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user
      {
        auth: {
          persistSession: false,
        },
      },
    )

    // The client should send the correct media_type: 'DASH', 'MP3', 'HLS', 'MP4', 'Video', 'Other'
    const { error } = await supabaseClient.from('voice_commands_log').insert({
      user_id,
      command,
      media_type, // New field
      timestamp: new Date().toISOString(),
      success: true,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log command to Supabase' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ message: 'Command logged successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
