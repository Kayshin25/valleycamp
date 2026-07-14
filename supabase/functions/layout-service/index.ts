import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // 1. Authenticate the user using their own JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + (authError?.message ?? 'Invalid session') }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const userId = user.id
    
    // 2. Parse request body
    const body = await req.json()
    const { action } = body

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize admin client to perform database and storage operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Handle Create Layout Action
    if (action === 'create') {
      const { title, description, category, farm_type, planner_data, image } = body

      // Validations
      if (!title || typeof title !== 'string' || title.trim().length < 3 || title.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Title must be between 3 and 100 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const validCategories = ['farm', 'animals', 'artisan']
      if (!category || !validCategories.includes(category)) {
        return new Response(
          JSON.stringify({ error: 'Invalid category. Must be farm, animals, or artisan.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!image) {
        return new Response(
          JSON.stringify({ error: 'Farm layout image is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Decode base64 image
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!match) {
        return new Response(
          JSON.stringify({ error: 'Invalid image format. Must be a base64 encoded image.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const mimeType = match[1]
      const base64Data = match[2]
      
      // Decoded bytes using atob
      const binaryString = atob(base64Data)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Check file size (max 5MB)
      if (bytes.length > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'Image size exceeds the 5MB limit' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const fileExt = mimeType.split('/')[1] || 'png'
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('layouts')
        .upload(fileName, bytes, {
          contentType: mimeType,
          upsert: true
        })

      if (uploadError) {
        return new Response(
          JSON.stringify({ error: 'Failed to upload image to storage: ' + uploadError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('layouts')
        .getPublicUrl(fileName)

      // Insert into layouts database table
      const { data: layoutData, error: dbError } = await supabaseAdmin
        .from('layouts')
        .insert({
          user_id: userId,
          title,
          description,
          image_url: publicUrl,
          planner_data,
          category,
          farm_type: farm_type || 'standard'
        })
        .select()
        .single()

      if (dbError) {
        // Cleanup storage file if DB insert fails
        await supabaseAdmin.storage.from('layouts').remove([fileName])
        return new Response(
          JSON.stringify({ error: 'Failed to save layout to database: ' + dbError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, layout: layoutData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle Edit Layout Action
    if (action === 'edit') {
      const { id, title, description, category, farm_type, planner_data, image } = body

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Layout ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check ownership
      const { data: existingLayout, error: findError } = await supabaseAdmin
        .from('layouts')
        .select('*')
        .eq('id', id)
        .single()

      if (findError || !existingLayout) {
        return new Response(
          JSON.stringify({ error: 'Layout not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (existingLayout.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You do not own this layout' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validations
      if (!title || typeof title !== 'string' || title.trim().length < 3 || title.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Title must be between 3 and 100 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const validCategories = ['farm', 'animals', 'artisan']
      if (!category || !validCategories.includes(category)) {
        return new Response(
          JSON.stringify({ error: 'Invalid category. Must be farm, animals, or artisan.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let finalImageUrl = existingLayout.image_url

      // Handle new image upload if provided
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
        if (!match) {
          return new Response(
            JSON.stringify({ error: 'Invalid image format. Must be a base64 encoded image.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const mimeType = match[1]
        const base64Data = match[2]
        
        const binaryString = atob(base64Data)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        if (bytes.length > 5 * 1024 * 1024) {
          return new Response(
            JSON.stringify({ error: 'Image size exceeds the 5MB limit' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete old image from storage if path matches standard structure
        const oldPath = existingLayout.image_url.split('/layouts/')[1]
        if (oldPath) {
          await supabaseAdmin.storage.from('layouts').remove([oldPath])
        }

        // Upload new image
        const fileExt = mimeType.split('/')[1] || 'png'
        const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('layouts')
          .upload(fileName, bytes, {
            contentType: mimeType,
            upsert: true
          })

        if (uploadError) {
          return new Response(
            JSON.stringify({ error: 'Failed to upload new image to storage: ' + uploadError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('layouts')
          .getPublicUrl(fileName)
        
        finalImageUrl = publicUrl
      }

      // Update database table
      const { data: updatedLayout, error: updateError } = await supabaseAdmin
        .from('layouts')
        .update({
          title,
          description,
          category,
          farm_type: farm_type || 'standard',
          planner_data,
          image_url: finalImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update layout in database: ' + updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, layout: updatedLayout }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle Delete Layout Action
    if (action === 'delete') {
      const { id } = body

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Layout ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check ownership
      const { data: existingLayout, error: findError } = await supabaseAdmin
        .from('layouts')
        .select('*')
        .eq('id', id)
        .single()

      if (findError || !existingLayout) {
        return new Response(
          JSON.stringify({ error: 'Layout not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (existingLayout.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You do not own this layout' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Delete image from storage
      const oldPath = existingLayout.image_url.split('/layouts/')[1]
      if (oldPath) {
        await supabaseAdmin.storage.from('layouts').remove([oldPath])
      }

      // Delete from database
      const { error: deleteError } = await supabaseAdmin
        .from('layouts')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete layout from database: ' + deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Layout successfully deleted' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
