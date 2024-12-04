{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crate2nix = {
      url = "github:nix-community/crate2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nix2container = {
      url = "github:nlewo/nix2container";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ flake-parts, devenv, crate2nix, gitignore, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ devenv.flakeModule ];
      systems = [ "x86_64-linux" ];

      perSystem = { lib, pkgs, system, ... }:
        let
          OTEL_SERVICE_NAME = "estoque";
          inherit (gitignore.lib) gitignoreSource;
        in
        rec {
          checks = {
            backend = packages.backend.override {
              runTest = true;
            };
          };

          packages = {
            frontend = pkgs.callPackage ./frontend { inherit gitignoreSource; };
            backend = pkgs.callPackage ./backend {
              inherit gitignoreSource;
              crate2nix = crate2nix.tools.${system};
            };

            dockerImage = pkgs.dockerTools.buildLayeredImage {
              name = "estoque";
              contents = [ pkgs.busybox ];
              config = {
                Cmd = [ "${packages.backend}/bin/backend" ];
                Env = [
                  "ASSETS_PATH=${packages.frontend}"
                  "PORT=80"
                  "OTEL_SERVICE_NAME=${OTEL_SERVICE_NAME}"
                ];
                ExposedPorts = { "80/tcp" = { }; };
              };
            };

            pushImage = pkgs.writeShellScriptBin "pushImage" ''
              ${lib.getExe pkgs.skopeo} --insecure-policy copy \
                --dest-precompute-digests \
                --dest-creds "$CI_REGISTRY_USER:$CI_REGISTRY_PASSWORD" \
                docker-archive:${packages.dockerImage} \
                docker://$CI_REGISTRY_IMAGE:${builtins.hashFile "sha256" "${packages.dockerImage}"}
            '';

            default = packages.backend;
          };

          devenv.shells.default = {
            env = {
              inherit OTEL_SERVICE_NAME;
            };

            imports = [
              ./devenv.nix
              ./backend/devenv.nix
              ./frontend/devenv.nix
            ];
          };
        };
    };
}
