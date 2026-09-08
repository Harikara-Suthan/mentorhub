import { prisma, Role } from "../config/prisma";

export interface MessageDTO {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ConversationSummary {
  participantId: string;
  participantName: string;
  participantRole: string;
  participantEmail?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export class MessageService {
  async getConversations(currentUserId: string, currentUserRole: Role): Promise<ConversationSummary[]> {
    const allMessages: MessageDTO[] = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Find all users this person has exchanged messages with
    const participantMap = new Map<string, { lastMsg: MessageDTO; unread: number }>();

    for (const msg of allMessages) {
      if (msg.senderId === currentUserId || msg.recipientId === currentUserId) {
        const otherId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
        if (!participantMap.has(otherId)) {
          const unread = allMessages.filter(
            (m) => m.senderId === otherId && m.recipientId === currentUserId && !m.isRead
          ).length;
          participantMap.set(otherId, { lastMsg: msg, unread });
        }
      }
    }

    // Also populate default contacts if no chat history exists yet
    const users = await prisma.user.findMany({ include: { student: true, mentor: true } });
    const me = users.find((u) => u.id === currentUserId);

    if (currentUserRole === "STUDENT" && me?.student?.mentorId) {
      const mentor = await prisma.mentor.findUnique({ where: { id: me.student.mentorId } });
      if (mentor?.userId && !participantMap.has(mentor.userId)) {
        participantMap.set(mentor.userId, {
          lastMsg: {
            id: "init_mentor",
            senderId: mentor.userId,
            senderName: mentor.fullName,
            senderRole: "MENTOR",
            recipientId: currentUserId,
            recipientName: me.student.fullName,
            recipientRole: "STUDENT",
            content: "Faculty advisory direct channel open.",
            isRead: true,
            createdAt: new Date(),
          },
          unread: 0,
        });
      }
    }

    if (currentUserRole === "MENTOR" && me?.mentor) {
      const mentees = await prisma.student.findMany({ where: { mentorId: me.mentor.id } });
      for (const mentee of mentees) {
        if (mentee.userId && !participantMap.has(mentee.userId)) {
          participantMap.set(mentee.userId, {
            lastMsg: {
              id: `init_${mentee.id}`,
              senderId: mentee.userId,
              senderName: mentee.fullName,
              senderRole: "STUDENT",
              recipientId: currentUserId,
              recipientName: me.mentor.fullName,
              recipientRole: "MENTOR",
              content: "Student advisory chat ready.",
              isRead: true,
              createdAt: new Date(),
            },
            unread: 0,
          });
        }
      }
    }

    const conversations: ConversationSummary[] = [];

    for (const [otherId, info] of participantMap.entries()) {
      const otherUser = users.find((u) => u.id === otherId);
      const name =
        otherUser?.student?.fullName ||
        otherUser?.mentor?.fullName ||
        (info.lastMsg.senderId === otherId ? info.lastMsg.senderName : info.lastMsg.recipientName) ||
        otherUser?.email?.split("@")[0] ||
        "Colleague";

      const role = otherUser?.role || (info.lastMsg.senderId === otherId ? info.lastMsg.senderRole : info.lastMsg.recipientRole);

      conversations.push({
        participantId: otherId,
        participantName: name,
        participantRole: role,
        participantEmail: otherUser?.email,
        lastMessage: info.lastMsg.content,
        lastMessageTime: info.lastMsg.createdAt,
        unreadCount: info.unread,
      });
    }

    return conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  async getMessages(currentUserId: string, otherUserId: string): Promise<MessageDTO[]> {
    const all = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
    });

    const thread = all.filter(
      (m: MessageDTO) =>
        (m.senderId === currentUserId && m.recipientId === otherUserId) ||
        (m.senderId === otherUserId && m.recipientId === currentUserId)
    );

    // Mark unread messages sent to current user as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return thread;
  }

  async sendMessage(senderUserId: string, recipientUserId: string, content: string): Promise<MessageDTO> {
    if (!content || !content.trim()) {
      throw new Error("Message content cannot be empty.");
    }

    const users = await prisma.user.findMany({ include: { student: true, mentor: true } });
    const sender = users.find((u) => u.id === senderUserId);
    const recipient = users.find((u) => u.id === recipientUserId);

    if (!recipient) {
      throw new Error("Recipient user not found.");
    }

    const senderName = sender?.student?.fullName || sender?.mentor?.fullName || sender?.email?.split("@")[0] || "User";
    const recipientName = recipient?.student?.fullName || recipient?.mentor?.fullName || recipient?.email?.split("@")[0] || "Recipient";

    const newMsg = await prisma.message.create({
      data: {
        senderId: senderUserId,
        senderName,
        senderRole: sender?.role || "STUDENT",
        recipientId: recipientUserId,
        recipientName,
        recipientRole: recipient?.role || "STUDENT",
        content: content.trim(),
        isRead: false,
        createdAt: new Date(),
      },
    });

    return newMsg;
  }

  async markConversationRead(currentUserId: string, otherUserId: string): Promise<{ count: number }> {
    return prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCount(currentUserId: string): Promise<number> {
    return prisma.message.count({
      where: {
        recipientId: currentUserId,
        isRead: false,
      },
    });
  }

  async getAvailableContacts(currentUserId: string, currentUserRole: Role): Promise<{ id: string; name: string; email: string; role: Role }[]> {
    let users = await prisma.user.findMany({ include: { student: true, mentor: { include: { students: true } } } });
    
    // Apply access scoping
    if (currentUserRole === "HOD") {
      const hod = await prisma.mentor.findUnique({ where: { userId: currentUserId } });
      if (hod) {
        users = users.filter(u => {
          if (u.role === "STUDENT" && u.student) return u.student.departmentId === hod.departmentId;
          if ((u.role === "MENTOR" || u.role === "HOD") && u.mentor) {
             if (u.mentor.departmentId === hod.departmentId) return true;
             return (u.mentor as any).students?.some((s: any) => s.departmentId === hod.departmentId);
          }
          return false;
        });
      }
    } else if (currentUserRole === "MENTOR") {
      const mentor = await prisma.mentor.findUnique({ where: { userId: currentUserId }, include: { students: true } });
      if (mentor) {
        const studentUserIds = new Set(mentor.students.map(s => s.userId));
        users = users.filter(u => {
          if (u.role === "STUDENT") return studentUserIds.has(u.id);
          if (u.role === "HOD" && u.mentor) return u.mentor.departmentId === mentor.departmentId;
          return false;
        });
      }
    } else if (currentUserRole === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: currentUserId }, include: { mentor: { include: { user: true } } } });
      if (student) {
        users = users.filter(u => u.id === student.mentor?.userId);
      }
    }

    const filtered = users.filter((u) => u.id !== currentUserId);

    return filtered.map((u) => ({
      id: u.id,
      name: u.student?.fullName || u.mentor?.fullName || u.email.split("@")[0],
      email: u.email,
      role: u.role,
    }));
  }
}

export const messageService = new MessageService();
