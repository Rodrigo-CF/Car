Place your realistic cockpit model using one of these paths:

- /public/assets/models/cockpit_lhd.glb
- /public/assets/models/cockpit_lhd/scene.gltf
- /public/assets/models/cockpit/scene.gltf

Notes:
- Use a left-hand-drive cockpit model.
- If the steering wheel object name includes "wheel" or "steer", the app will auto-rotate it with A/D steering input.
- Full-car models are supported: the app uses name-based + spatial filtering to hide most exterior meshes and keep interior/cockpit parts.
- If no model is present, the app falls back to the built-in procedural cockpit.
