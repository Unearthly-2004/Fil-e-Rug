import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { voteOnChain } from '@/lib/filecoin-vote';
import { toast } from '@/hooks/use-toast';

const PENDING_VOTES_KEY = 'pendingVotes';

function getPendingVotes() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_VOTES_KEY) || '[]');
  } catch {
    return [];
  }
}
function removePendingVote(proposalId: string, userAddress: string) {
  const votes = getPendingVotes();
  const filtered = votes.filter((v: any) => v.proposalId !== proposalId || v.userAddress !== userAddress);
  localStorage.setItem(PENDING_VOTES_KEY, JSON.stringify(filtered));
}

const MyVotes = () => {
  const [pendingVotes, setPendingVotes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    setPendingVotes(getPendingVotes());
  }, []);

  const handleRemove = (proposalId: string, userAddress: string) => {
    removePendingVote(proposalId, userAddress);
    setPendingVotes(getPendingVotes());
    toast({ title: 'Vote Removed', description: 'Vote removed from My Votes.' });
  };

  const handleSubmit = async (voteObj: any) => {
    setSubmitting(voteObj.proposalId);
    try {
      const result = await voteOnChain(undefined, voteObj.proposalId, voteObj.vote === 'no-rug');
      if (result.success) {
        removePendingVote(voteObj.proposalId, voteObj.userAddress);
        setPendingVotes(getPendingVotes());
        toast({ title: 'Vote Submitted', description: 'Vote stored on-chain.' });
      } else {
        toast({ title: 'Vote Failed', description: result.error || 'Transaction failed', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Vote Error', description: 'Failed to submit vote. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">My Votes</h2>
        {pendingVotes.length === 0 ? (
          <div className="text-gray-500">No pending votes.</div>
        ) : (
          <div className="space-y-4">
            {pendingVotes.map((vote) => (
              <div key={vote.proposalId + vote.userAddress} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Proposal: {vote.proposalId}</div>
                  <div>Vote: <span className={vote.vote === 'rug' ? 'text-red-600' : 'text-green-600'}>{vote.vote}</span></div>
                  <div className="text-xs text-gray-400">Saved: {new Date(vote.timestamp).toLocaleString()}</div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleRemove(vote.proposalId, vote.userAddress)}>
                    Remove
                  </Button>
                  <Button onClick={() => handleSubmit(vote)} disabled={submitting === vote.proposalId}>
                    {submitting === vote.proposalId ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyVotes; 