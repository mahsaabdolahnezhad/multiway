package com.example.chain;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;


@RestController
public class ChainController {

    private final RestTemplate rest = new RestTemplate();
    private final String RUST_URL = "http://localhost:8002/chain";

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of("service", "java-service", "status", "running");
    }
    @GetMapping("/health")
public Map<String, String> health() {
    return Map.of("service", "java-service", "status", "healthy");
}

@GetMapping("/test_rust")
public ResponseEntity<?> testRust() {
    String testUrl = "http://localhost:8002/";

    try {
        Map resp = rest.getForObject(testUrl, Map.class);
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "rust_response", resp
        ));
    } catch (Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", "error",
                        "detail", ex.getMessage()
                ));
    }
}


    @PostMapping("/chain")
    public ResponseEntity<?> chain(@RequestBody Map<String, Object> body) {
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

            // Forward to Rust, keeping same JSON (Rust will post back to callback)
            ResponseEntity<Map> resp = rest.postForEntity(RUST_URL, req, Map.class);

            return ResponseEntity.ok(Map.of("status", "forwarded_to_rust", "rust_response", resp.getBody()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("status", "error", "detail", ex.getMessage()));
        }
    }
}
