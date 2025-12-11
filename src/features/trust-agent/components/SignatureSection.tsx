import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { SignaturePad } from '@/shared/ui/SignaturePad';
import Input from '@/shared/ui/Input';
import { Label } from '@/shared/ui/label';
import { Check, PenLine, User, Building2 } from 'lucide-react';

export interface SignatureData {
  dataUrl: string;
  signerName: string;
  signedAt: string;
}

export interface SignaturesState {
  proprietaire?: SignatureData;
  locataire?: SignatureData;
}

interface SignatureSectionProps {
  signatures: SignaturesState;
  onSignaturesChange: (signatures: SignaturesState) => void;
  readOnly?: boolean;
}

function SignatureCard({
  title,
  icon: Icon,
  signature,
  onSignatureChange,
  readOnly = false
}: {
  title: string;
  icon: React.ElementType;
  signature?: SignatureData;
  onSignatureChange: (data: SignatureData | undefined) => void;
  readOnly?: boolean;
}) {
  const [name, setName] = useState(signature?.signerName || '');
  const isSigned = !!signature?.dataUrl;

  const handleSignatureChange = (dataUrl: string | null) => {
    if (dataUrl && name.trim()) {
      onSignatureChange({
        dataUrl,
        signerName: name.trim(),
        signedAt: new Date().toISOString()
      });
    } else if (!dataUrl) {
      onSignatureChange(undefined);
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (signature?.dataUrl && newName.trim()) {
      onSignatureChange({
        ...signature,
        signerName: newName.trim()
      });
    }
  };

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="p-4 bg-card rounded-xl border border-border space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSigned ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
            }`}>
              <Icon className={`h-5 w-5 ${
                isSigned ? 'text-green-600' : 'text-muted-foreground'
              }`} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{title}</h3>
              {isSigned && signature?.signedAt && (
                <p className="text-xs text-muted-foreground">
                  Signé le {new Date(signature.signedAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          
          {isSigned && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">Signé</span>
            </div>
          )}
        </div>

        {/* Name Input */}
        <div>
          <Label className="text-sm">Nom complet</Label>
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)}
            placeholder="Entrez le nom du signataire"
            disabled={readOnly}
            className="mt-1"
          />
        </div>

        {/* Signature Pad */}
        <div>
          <Label className="text-sm flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            Signature
          </Label>
          <div className="mt-2">
            <SignaturePad
              height={150}
              onSignatureChange={handleSignatureChange}
              initialSignature={signature?.dataUrl}
              readOnly={readOnly || !name.trim()}
              required
            />
          </div>
          {!name.trim() && !readOnly && (
            <p className="text-xs text-muted-foreground mt-1">
              Entrez le nom pour activer la signature
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SignatureSection({
  signatures,
  onSignaturesChange,
  readOnly = false
}: SignatureSectionProps) {
  const handleProprietaireChange = (data: SignatureData | undefined) => {
    onSignaturesChange({
      ...signatures,
      proprietaire: data
    });
  };

  const handleLocataireChange = (data: SignatureData | undefined) => {
    onSignaturesChange({
      ...signatures,
      locataire: data
    });
  };

  const bothSigned = !!signatures.proprietaire?.dataUrl && !!signatures.locataire?.dataUrl;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-primary" />
          Signatures Électroniques
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Les deux parties doivent signer pour valider l'état des lieux
        </p>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <SignatureCard
            title="Propriétaire"
            icon={Building2}
            signature={signatures.proprietaire}
            onSignatureChange={handleProprietaireChange}
            readOnly={readOnly}
          />
          
          <SignatureCard
            title="Locataire"
            icon={User}
            signature={signatures.locataire}
            onSignatureChange={handleLocataireChange}
            readOnly={readOnly}
          />
        </div>

        {/* Status Banner */}
        <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
          bothSigned 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
        }`}>
          {bothSigned ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Document prêt pour validation
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Les deux signatures ont été apposées
                </p>
              </div>
            </>
          ) : (
            <>
              <PenLine className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Signatures requises
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  {!signatures.proprietaire?.dataUrl && !signatures.locataire?.dataUrl
                    ? 'Les deux signatures sont manquantes'
                    : !signatures.proprietaire?.dataUrl
                    ? 'Signature du propriétaire manquante'
                    : 'Signature du locataire manquante'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Legal Notice */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          En signant ce document, vous acceptez les conditions décrites dans l'état des lieux.
          <br />
          Ce document a valeur légale conformément à la réglementation en vigueur.
        </p>
      </CardContent>
    </Card>
  );
}

export default SignatureSection;
