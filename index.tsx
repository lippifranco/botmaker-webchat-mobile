"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function Chat() {
  const chatExecuted = useRef(false);
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingScript = document.getElementById('botmaker-script');
    const token = searchParams.get('token') || ''; // Parametros
    const checkUser: UserData | null = checkToken(token);

  if (checkUser !== null && !existingScript) {
      setUserData(checkUser);
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.id = 'botmaker-script';
      script.src = 'https://go.botmaker.com/rest/webchat/p/xxxxx/init.js';

      document.head.appendChild(script);

      // Add variables Botmaker
      (window as any).BOTMAKER_VAR = {
        firstName: checkUser?.userName,
        nombre: checkUser?.userName,
        idUsuario: checkUser?.userId,
        email: checkUser?.userEmail,
        telefono: checkUser?.userPhone,
        deriva_inapp: true,
        ...checkUser
      };
    }
    console.log((window as any).BOTMAKER_VAR);
    return () => {
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [searchParams]);

  useEffect(() => {
    if (!chatExecuted.current) {
        chatExecuted.current = true;
        executeChat();
    }
  }, []);


  function executeChat(): void {
    const botmaker = (window as any).botmaker;
    if (typeof botmaker !== 'undefined') {
      const iframe = document.querySelector('iframe[title="Botmaker"]') as HTMLIFrameElement;
      if (iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          // Remover header on callback
          window.BOTMAKER_ACTION = {
            onload: () => { // Callback Botmaker
              const header = iframeDocument.querySelector('.wc-header') as HTMLElement | null;
              if (header) {
                console.debug('Chat header detected');
                header.style.display = 'none';
              }
            }
          };
        }
      }
    }
  }

  return (<div id="botmaker-chat"></div>);
}
