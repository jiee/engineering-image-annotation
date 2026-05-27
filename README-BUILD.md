# Build Instructions

## Win32 Cross-Compilation Setup

This project supports cross-compilation for Windows 32-bit (Win32) from Linux using MinGW-w64.

### Prerequisites

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  cmake \
  meson \
  ninja-build \
  pkg-config \
  git \
  mingw-w64 \
  mingw-w64-i686-dev \
  gcc-mingw-w64 \
  g++-mingw-w64
```

#### macOS
```bash
brew install mingw-w64 meson ninja
```

### ImGui Setup

ImGui is automatically cloned during the build process. To manually set it up:

```bash
mkdir -p deps
cd deps
git clone https://github.com/ocornut/imgui.git
cd imgui
git checkout v1.89
cd ../..
```

### Building with Meson (Recommended)

```bash
# Quick build script
chmod +x build-win32.sh
./build-win32.sh

# Or manual steps:
mkdir builddir-win32
meson setup builddir-win32 \
  --cross-file=cross-i686-w64-mingw32.ini \
  -Dprefix=$(pwd)/install-win32 \
  -Dbuildtype=release

meson compile -C builddir-win32
meson install -C builddir-win32
```

### Building with CMake

```bash
mkdir build-win32
cd build-win32
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=../cmake/mingw-toolchain.cmake \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INSTALL_PREFIX=$(pwd)/../install-win32

cmake --build . --config Release
cmake --install .
cd ..
```

### Docker Build

```bash
# Build Docker image
docker build -t annotation-win32-builder .

# Build inside container
docker run --rm -v $(pwd):/workspace annotation-win32-builder \
  bash -c "./build-win32.sh"
```

### CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/build-win32.yml`) automatically:
1. Sets up the cross-compile environment
2. Clones and builds ImGui
3. Compiles the application for Win32
4. Uploads build artifacts
5. Tests on Windows runner

Trigger by pushing to `main` or `develop` branches.

## Output

Build artifacts are located in:
- **Meson**: `install-win32/`
- **CMake**: `install-win32/`
- **Docker**: Mounted to `/workspace/install-win32/`

## Testing

Run tests locally:
```bash
./builddir-win32/test-app
```

Or on Windows:
```cmd
install-win32\bin\test-app.exe
```

## Troubleshooting

### Missing ImGui
```bash
git submodule init
git submodule update
```

### MinGW not found
```bash
which i686-w64-mingw32-gcc
# If not found, reinstall:
sudo apt-get install --reinstall mingw-w64 gcc-mingw-w64 g++-mingw-w64
```

### Meson configuration error
```bash
rm -rf builddir-win32
meson setup builddir-win32 --wipe ...
```
