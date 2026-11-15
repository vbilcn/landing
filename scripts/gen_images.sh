#!/bin/bash
# Generate brand imagery for E-METHANE-100 portal
cd /home/z/my-project/public/images

z-ai image -p "Cinematic ultra-wide shot of a futuristic hybrid renewable energy complex at dusk: onshore wind turbines on dark hills, vast solar panel array in foreground, hydroelectric dam with reservoir in background, compact industrial synthetic fuel plant with glowing cyan pipes and emerald accent lights, deep navy blue sky with volumetric fog, professional corporate tech photography, photorealistic, moody dark atmosphere, teal and amber highlights, no text, no watermark" -o "./hero-vie.png" -s 1440x720 &
P1=$!

z-ai image -p "Clean industrial close-up of a stainless steel shell-and-tube chemical reactor, polished flanges and intricate piping networks, pressure gauges, soft electric blue glow from indicator lights, shallow depth of field, dark industrial hall background, professional corporate tech photography, photorealistic, crisp details, no text, no watermark" -o "./reactor.png" -s 1344x768 &
P2=$!

z-ai image -p "Extreme macro photograph of grey ceramic catalyst pellets, nickel-alumina extrudate cylinders in a polished metal sample tray, metallic silver tones, shallow depth of field, dark laboratory background with subtle cyan rim lighting, photorealistic scientific photography, no text, no watermark" -o "./catalyst.png" -s 1344x768 &
P3=$!

z-ai image -p "Industrial hydrogen pipeline system glowing at night, rows of steel pipes with luminous cyan and emerald green accent lighting along valves and gauges, dark graphite industrial setting, futuristic clean energy plant atmosphere, professional photography, shallow depth of field, photorealistic, no text, no watermark" -o "./pipeline.png" -s 1344x768 &
P4=$!

z-ai image -p "Secure digital data room interior at night, dark modern corporate office with large wall monitors showing glowing financial charts and dashboards in cyan and amber colors, glass walls reflecting light, cinematic professional corporate photography, deep navy palette, photorealistic, no people, no readable text, no watermark" -o "./dataroom.png" -s 1440x720 &
P5=$!

z-ai image -p "Industrial carbon capture facility at blue hour, tall steel absorber columns and dense piping next to a cement plant, faint vapor plumes, cool blue tones with warm amber safety lights, wide-angle professional industrial photography, photorealistic, dark moody sky, no text, no watermark" -o "./capture.png" -s 1344x768 &
P6=$!

wait $P1 $P2 $P3 $P4 $P5 $P6
echo "DONE. Files:"
ls -la /home/z/my-project/public/images/
