import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Heading,
    Table,
    Text,
    VStack,
    Input,
    HStack,
} from '@chakra-ui/react';
import { AuthenticationService, UserRequest } from '../../../client';
import { toaster } from '../../../toaster';

// Assuming Modal components if Dialog is not correct or if standard names changed. 
// Using standard Modal names for safety if unsure, but v3 might be "Dialog".
// "recipe_ui" uses "@chakra-ui/react": "^3.30.0". 
// I'll try to find Modal/Dialog usage.
// I'll write code using "Dialog" but might need to adjust.

const AdminPendingRequests = () => {
    const [requests, setRequests] = useState<UserRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
    const [initialPassword, setInitialPassword] = useState('');
    const [isApproving, setIsApproving] = useState(false);
    // const { isOpen, onOpen, onClose } = useDisclosure(); 
    // v3 might use controlled Dialog or Trigger/Content.

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await AuthenticationService.listPendingRequestsAuthPendingRequestsGet();
            setRequests(data);
        } catch {
            toaster.create({
                title: "Failed to fetch requests",
                type: "error",
            });
        }
    };

    const handleApproveClick = (request: UserRequest) => {
        setSelectedRequest(request);
        setInitialPassword(''); // Reset or generate random?
        setIsDialogOpen(true);
    };

    const confirmApprove = async () => {
        if (!selectedRequest || !initialPassword) return;

        setIsApproving(true);
        try {
            await AuthenticationService.approveRequestAuthApproveRequestRequestIdPost(selectedRequest.id, {
                initial_password: initialPassword
            });
            toaster.create({
                title: "Request Approved",
                type: "success",
            });
            setIsDialogOpen(false);
            fetchRequests();
        } catch (error: any) {
            toaster.create({
                title: "Failed to approve request",
                description: error.body?.detail || "Unknown error",
                type: "error",
            });
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <Box>
            {requests.length === 0 ? (
                <Text color="fg.muted">No pending requests.</Text>
            ) : (
                <Box borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor="border.default">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row bg="bg.surface">
                                <Table.ColumnHeader color="fg.default">Email</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Name</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Actions</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {requests.map((request) => (
                                <Table.Row key={request.id} bg="bg.surface" color="fg.default" _hover={{ bg: "bg.muted" }}>
                                    <Table.Cell borderColor="border.default">{request.email}</Table.Cell>
                                    <Table.Cell borderColor="border.default">{request.first_name} {request.last_name}</Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <Button
                                            size="sm"
                                            bg="vscode.button"
                                            color="white"
                                            _hover={{ bg: 'vscode.buttonHover' }}
                                            onClick={() => handleApproveClick(request)}
                                        >
                                            Approve
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>
            )}

            {/* Simple Modal Implementation using basic Box overlay if Dialog complex, but let's try standard V2 Modal first if I can't confirm V3??
               Wait, "Dialog" was imported. 
               Let's try to assume v3 "Dialog" if I can.
               Actually, I'll stick to a simple custom overlay if I want to be safe or check existing code.
               I'll search for "Modal" in codebase.
            */}
            {isDialogOpen && (
                <Box
                    position="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(0,0,0,0.6)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1000}
                    backdropFilter="blur(4px)"
                >
                    <Box bg="bg.surface" p={6} borderRadius="xl" minW="400px" boxShadow="xl" borderWidth="1px" borderColor="border.default">
                        <Heading size="sm" mb={4} color="fg.default">Approve Request for {selectedRequest?.email}</Heading>
                        <VStack gap={4} align="stretch">
                            <Box>
                                <Text mb={2} fontSize="sm" color="fg.default">Set Initial Password</Text>
                                <Input
                                    value={initialPassword}
                                    onChange={(e) => setInitialPassword(e.target.value)}
                                    placeholder="Enter initial password"
                                    type="password"
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                />
                            </Box>
                            <HStack justify="flex-end" gap={3}>
                                <Button variant="ghost" color="fg.muted" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={confirmApprove}
                                    loading={isApproving}
                                    disabled={!initialPassword}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: 'vscode.buttonHover' }}
                                >
                                    Confirm
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AdminPendingRequests;
