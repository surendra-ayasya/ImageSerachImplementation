import { useEffect, useRef } from "react";

function ShadowContainer({ id, htmlContent }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && htmlContent) {
      // Create a Shadow DOM
      const shadow = containerRef.current.attachShadow({ mode: "open" });
      shadow.innerHTML = htmlContent;

      // Optionally copy styles from the third-party API to the Shadow DOM
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      styles.forEach((link) => {
        const styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = link.href;
        shadow.appendChild(styleLink);
      });
    }
  }, [htmlContent]);

  return <div ref={containerRef} id={id} className="kajaria-shared" />;
}

function KajariaLayout({ children }) {
  const iframeRef = useRef();

  useEffect(() => {
    // Suppress script errors
    function suppressScriptError(e) {
      if (e.message === "Script error.") {
        e.preventDefault();
      }
    }
    window.addEventListener("error", suppressScriptError);
    return () => {
      window.removeEventListener("error", suppressScriptError);
    };
  }, []);

  useEffect(() => {
    fetch("https://demowebsite.kajariaceramics.com/api/shared-dependencies")
      .then((res) => res.text())
      .then((html) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;

        // Load stylesheets (only if needed outside Shadow DOM)
        temp.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          if (!document.head.querySelector(`link[href="${link.href}"]`)) {
            document.head.appendChild(link.cloneNode(true));
          }
        });

        const scripts = Array.from(temp.querySelectorAll("script"));
        function loadScriptsSequentially(scripts, cb) {
          if (!scripts.length) return cb();
          const script = document.createElement("script");
          script.src = scripts[0].src;
          script.onload = () => loadScriptsSequentially(scripts.slice(1), cb);
          document.head.appendChild(script);
        }

        loadScriptsSequentially(scripts, () => {
          // Fetch header
          fetch("https://demowebsite.kajariaceramics.com/api/shared-header")
            .then((res) => res.text())
            .then((headerHtml) => {
              const header = document.getElementById("shared-header");
              if (header) header.innerHTML = headerHtml; // Shadow DOM will handle isolation

              if (typeof window.attachIframeSearchToggle === "function")
                window.attachIframeSearchToggle();
              if (typeof window.reinitKajariaDropdowns === "function")
                window.reinitKajariaDropdowns();
              if (typeof window.reinitKajariaMobile === "function")
                window.reinitKajariaMobile();

              setTimeout(() => {
                if (window.bootstrap && window.bootstrap.Dropdown) {
                  document.querySelectorAll(".dropdown-toggle").forEach((el) => {
                    try {
                      new window.bootstrap.Dropdown(el);
                    } catch (e) {}
                  });
                }
              }, 100);
            });

          // Fetch footer
          fetch("https://demowebsite.kajariaceramics.com/api/shared-footer")
            .then((res) => res.text())
            .then((footerHtml) => {
              const footer = document.getElementById("shared-footer");
              if (footer) footer.innerHTML = footerHtml; // Shadow DOM will handle isolation

              if (typeof window.setupFooterFormsJQ === "function")
                window.setupFooterFormsJQ();
            });
        });
      })
      .catch((error) => console.error("Error loading Kajaria assets:", error));
  }, []);

  return (
    <>
      <ShadowContainer id="shared-header" />
      <div className="app-wrapper relative z-[1] min-h-screen">
        {children}
        <iframe
          ref={iframeRef}
          id="kajaria-search-iframe"
          src="https://demowebsite.kajariaceramics.com/search-bar-embed"
          style={{
            width: "100vw",
            maxWidth: "100vw",
            height: "100vh",
            border: "none",
            overflow: "visible",
            zIndex: 9999,
            position: "fixed",
            top: "50px",
            boxShadow: "-1px 7px 18px 0px #0000002e",
            display: "none",
          }}
          scrolling="no"
          frameBorder="0"
        ></iframe>
      </div>
      <ShadowContainer id="shared-footer" />
      <style>{`
        #shared-header, #shared-footer {
          margin: 0 !important;
          padding: 0 !important;
        }
        body {
          overflow-x: hidden !important;
        }
      `}</style>
    </>
  );
}

export default KajariaLayout;