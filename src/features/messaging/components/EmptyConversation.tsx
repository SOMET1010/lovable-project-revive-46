import { Lock } from 'lucide-react';

export function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#222E35] p-8">
      {/* WhatsApp style illustration */}
      <div className="w-64 h-64 mb-8 opacity-30">
        <svg viewBox="0 0 303 172" className="w-full h-full">
          <path 
            fill="#364147" 
            d="M229.565 160.229c32.647 0 59.167-26.521 59.167-59.167S262.213 41.896 229.565 41.896c-32.646 0-59.166 26.521-59.166 59.166s26.52 59.167 59.166 59.167zm-130.96-71.39c0-13.376 10.854-24.224 24.237-24.224 13.375 0 24.23 10.848 24.23 24.224 0 13.37-10.855 24.217-24.23 24.217-13.383 0-24.237-10.847-24.237-24.217zm-41.417 71.39c32.647 0 59.167-26.521 59.167-59.167s-26.52-59.166-59.167-59.166S-2.146 68.416-2.146 101.062s26.521 59.167 59.334 59.167z"
          />
          <path 
            fill="#364147" 
            d="M229.565 137.727c20.263 0 36.672-16.411 36.672-36.665s-16.409-36.665-36.672-36.665c-20.263 0-36.665 16.411-36.665 36.665s16.402 36.665 36.665 36.665zm-160.198-24.482c0-7.322 5.94-13.256 13.266-13.256 7.319 0 13.259 5.934 13.259 13.256 0 7.316-5.94 13.25-13.259 13.25-7.326 0-13.266-5.934-13.266-13.25zm-12.48 24.482c20.263 0 36.665-16.411 36.665-36.665s-16.402-36.665-36.665-36.665c-20.263 0-36.665 16.411-36.665 36.665s16.402 36.665 36.665 36.665z"
          />
        </svg>
      </div>

      <h3 className="text-3xl font-light text-[#E9EDEF] mb-3">Mon Toit Web</h3>
      
      <p className="text-[#8696A0] text-center max-w-md text-sm leading-relaxed mb-8">
        Envoyez et recevez des messages concernant vos biens immobiliers. 
        Sélectionnez une conversation ou démarrez-en une nouvelle depuis une annonce.
      </p>

      {/* Encryption notice - WhatsApp style */}
      <div className="flex items-center gap-2 text-[#667781] text-xs">
        <Lock className="h-3 w-3" />
        <span>Vos messages sont sécurisés</span>
      </div>
    </div>
  );
}
