# Three.js TypeScript Boilerplate

## Installing

1. Clone Repository

```bash
git clone https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
```

2. CD into folder

```bash
cd Three.js-TypeScript-Boilerplate
```

3. Install TypeScript

```bash
npm install -g typescript
```

4. Install dependencies

```bash
npm install
```

5. Start it

```bash
npm run dev
```

6. Visit [http://127.0.0.1:8080](http://127.0.0.1:8080)


7. Edit project in VSCode

```bash
code .
```
8. Deploy to github pages
```bash
npm run build
npm run deploy
```

9. Deploy to netflify

Specify /dist/client when promted for dir
```bash
netlify deploy
netfliy deploy --prod
```


## Updating to add new maps
1. Run Snowmixer->print map file
2. Add generated JSON to client.ts
3. Grab ground texture from shared_textures.pak (level_xx_xx_xx_map.pct)
    Convert to TGA with QCPCT, then TGA->PNG with photopea/photoshop/paint.net (must set alpha channel to 255)
4. Add ground texture file to /dist/client
5. Add button to show new map
6. Deploy