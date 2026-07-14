import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  equipment: z.string().min(2),
  brand: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  reported_issue: z.string().min(5),
});

export const openTicket = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find or create customer by phone
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("phone", data.phone)
      .maybeSingle();

    let customerId = existing?.id;
    if (!customerId) {
      const { data: created, error: cErr } = await supabaseAdmin
        .from("customers")
        .insert({
          name: data.name,
          phone: data.phone,
          email: data.email || null,
        })
        .select("id")
        .single();
      if (cErr) throw new Error(cErr.message);
      customerId = created.id;
    }

    const { data: order, error: oErr } = await supabaseAdmin
      .from("service_orders")
      .insert({
        customer_id: customerId,
        equipment: data.equipment,
        brand: data.brand || null,
        model: data.model || null,
        reported_issue: data.reported_issue,
        status: "aberta",
        priority: "normal",
      })
      .select("order_number")
      .single();
    if (oErr) throw new Error(oErr.message);

    return { order_number: order.order_number };
  });
