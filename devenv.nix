{ lib, pkgs, ... }: {
  env = {
    OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4317";
    OTEL_TRACES_EXPORTER = "otlp";
    OTEL_EXPORTER_OTLP_PROTOCOL = "grpc";
    VITE_BASE_URL = "/api";
  };
  processes.otel.exec = "${lib.getExe pkgs.otel-desktop-viewer}";

  services.caddy = {
    enable = true;
    config = ''
      {
        https_port 8443
        http_port 8080
        skip_install_trust
      }
    '';
    virtualHosts = {
      localhost = {
        extraConfig = ''
          reverse_proxy :3000
        '';
      };
    };
  };
}
